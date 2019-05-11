import Vue from 'vue';
import Router from 'vue-router';
import MainPage from '@/components/page/Main';
import HomePage from '@/components/page/Home';
import MarketPage from '@/components/page/Market';
import TradePage from '@/components/page/Trade';
import InvestPage from '@/components/page/Invest';
import MyPage from '@/components/page/My';
import MarketChartPage from '@/components/page/MarketChart';
import EntrustPage from '@/components/page/Entrust';
import RecordPage from '@/components/page/Record';
import SearchPage from '@/components/page/Search';
import SettingPage from '@/components/page/Setting';
import UpCoinPage from '@/components/page/UpCoin';
import CoinList from '@/components/page/CoinList';
import About from '@/components/page/About';
import CoinCost from '@/components/page/CoinCost';
// import WithDrawCoin from '@/components/page/WithDrawCoin';

Vue.use(Router);

var router = new Router({
  routes: [
    {
      path: '/',
      component: MainPage,
      children: [
        {
          path: '/',
          component: HomePage
        },
        {
          path: '/home',
          component: HomePage
        },
        {
          path: '/market',
          component: MarketPage
        },
        {
          path: '/trade/:currencyId?/:tradeType?',
          component: TradePage
        },
        {
          path: '/my',
          component: MyPage
        }
      ]
    },
    {
      path: '/invest',
      component: InvestPage
    },
    {
      path: '/market/chart/:currencyId?',
      component: MarketChartPage
    },
    {
      path: '/my/entrust',
      component: EntrustPage
    },
    {
      path: '/my/record',
      component: RecordPage
    },
    {
      path: '/market/search',
      component: SearchPage
    },
    {
      path: '/setting',
      component: SettingPage
    },
    {
      path: '/upcoin',
      component: UpCoinPage
    },
    {
      path: '/coinlist',
      component: CoinList
    },
    {
      path: '/about',
      component: About
    },
    {
      path: '/coincost',
      component: CoinCost
    }
    // {
    //   path: '/withdraw',
    //   component: WithDrawCoin
    // }
  ]
});

router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0);
  next();
});

export default router;
