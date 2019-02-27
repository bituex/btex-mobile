# btex-mobile

> This UI code is btex online version.   
> Deploy your own decentralized exchange with code.

You must install [nodejs](https://nodejs.org) first.

## Setup
### 1.Download
### 2.Configure
Navigate to /src/common/utils.js modify host value, this url is to get K-line data. You can draw your own K-line chart by monitoring to the EOS transaction records of btexexchange.
```
host: 'https://www.btex.org'
```
### 3.Build
In the code root directory run
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```
### 4.Deploy
If you `npm run build` will create */dist* directory in root, copy to you website then decentralized exchange is deploy.

If you have any questions, please contact us.   
Telegram [@BTEX](https://t.me/btex)
