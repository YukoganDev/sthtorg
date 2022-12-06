import { User } from '@prisma/client';
import { Router, Request, Response, NextFunction, request } from 'express';
import requestPromise from 'request-promise';
import { AccountResult, checkCredentials } from '../accountdb/user';
import { config } from '../config';

export const router = Router();

let routerViewPrefix = '';

// Index
router.get('/', (req, res, next) => {
    let disabled = 'disabled';
    let dmsg = '(Insufficient permissions)';
    if (req.session.user && req.session.user === 'Yukogan') {
        disabled = '';
        dmsg = '';
    }
  res.render(`${routerViewPrefix}index`, { user: req.session.user || null, disabled, dmsg });
});

// Learn
router.get('/learn', checkLogin, (req, res, next) => {
  res.render(`${routerViewPrefix}learn`, { user: req.session.user || null });
});

// Login
router.get('/login', (req, res, next) => {
  checkLogin(req, res, () => {
    res.redirect('/');
  });
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  let email = req.body.email || '';
  let password = req.body.password || '';
  console.log(email, password);
  checkCredentials({ email, password }, (result: AccountResult, user: User) => {
    if (result === AccountResult.SUCCESS) {
      req.session.user = user.name;
      res.redirect('back');
      return;
    } else if (result === AccountResult.ERROR) {
      res.render(`${routerViewPrefix}login`, { msg: 'Invalid credentials' });
      return;
    } else if (result === AccountResult.UNKNOWN_USER) {
      res.render(`${routerViewPrefix}login`, {
        msg: `Unknown email: ${email}`,
      });
    } else {
      res.redirect('login');
    }
  });
});

export function checkLogin(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user) {
    next();
  } else {
    //res.redirect('login?next=' + req.params.next);
    res.render(`${routerViewPrefix}login`, {
      msg: 'You need to be authenticated in order to access this',
    });
  }
}

declare module 'express-session' {
  interface SessionData {
    user: string;
  }
}

// Logout
router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.session.user = undefined;
  res.redirect('/');
});

// Card
router.get('/card/:cardId', (req, res, next) => {
  res.render(`${routerViewPrefix}card`, {
    user: req.session.user || null,
    cardid: req.params.cardId || null,
  });
});

// Admin
router.get('/admin', checkLogin, (req, res, next) => {
    if (req.session.user && req.session.user === 'Yukogan') {
        res.render('admin')
    } else {
        res.json({
            error: 'No permission'
        });
    }
});

// MuseScore Scraper

router.get('/musescore', (req, res, next) => {
  res.render('musescorescraper');
});

router.post('/musescore', (req, res, next) => {
  let url = req.body.url;
  // console.log(req.headers);
  if (!url) { console.error('No url provided'); return; }
  requestPromise(url, (error: any, response: any, html: any) => {
    if (error && response.statusCode == 200) {
      //console.log(html);
      
    }
    console.log(html);
    res.send(html);
  });
});