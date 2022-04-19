
## WhatsApp Clone Using React Native


## Installation

> See [Installation Instructions](https://reactnative.dev/docs/environment-setup).


## Running
```shell
git clone https://git-codecommit.ap-northeast-1.amazonaws.com/v1/repos/GenbaStar_App
cd GenbaStar_App
npm install
```


## iOS
```shell
npx pod-install
npx react-native run-ios
```

## Android
```shell
npx react-native run-android
```

## Setting for App
// GenbaStar_App/src/config/Constants.ts
```shell

// URL API
export const DOMAIN =
// URL API SOCKET
export const DOMAIN_SOCKET =
```

## Aws Configuration
// create aws-exports.ts follow path GenbaStar_App/src/aws-exports.ts
```javascript

const awsmobile = {
    "aws_project_region": "AWS_PROJECT_REGION",
    "aws_cognito_identity_pool_id": "AWS_COGNITO_IDENTITY_POOL_ID",
    "aws_cognito_region": "AWS_COGNITO_REGION",
    "aws_user_pools_id": "AWS_USER_POOLS_ID",
    "aws_user_pools_web_client_id": "AWS_USER_POOLS_WEB"
};
```
