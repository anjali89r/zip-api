# Serverless Node.js Starter



- **Generating optimized Lambda packages with Webpack**
- **Use ES7 syntax in your handler functions**
  - Use `import` and `export`
- **Run API Gateway locally**
  - Use `serverless offline start`
- **Support for unit tests**
  - Run `npm test` to run your tests
- **Sourcemaps for proper error messages**
  - Error message show the correct line numbers
  - Works in production with CloudWatch
- **Lint your code with ESLint**
- **Add environment variables for your stages**
- **No need to manage Webpack or Babel configs**

---

### Requirements

- [Install the Serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/installation/)
- [Configure your AWS CLI](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

### Installation



Enter the new directory

``` bash
$ git clone projecturl
```

Install the Node.js packages

``` bash
$ npm install
```
Install DynamoDB Local

``` bash
$ sls dynamodb install
```
### Usage

To run a locally

``` bash
$ serverless offline start
```
#deploy from local to aws account
``` bash
serverless deploy --stage prod --aws-profile ekatva --region ap-south-1
```


