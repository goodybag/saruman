# Saruman

Clone and then install node dependencies:

```
npm install
```

Install 3rd-party front-end libraries:

```
jam install
```

Make a static server in saruman root directory.

## Build and Deploy

Install grunt:

```
npm install grunt-cli
```

Running:

```
grunt
```

Will build everything in the ```build/``` directory. The built version uses the production API, so be careful when testing your build. To deploy:

```
grunt deploy
```