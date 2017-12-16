# Jive Race API

Jive Race API supports the Jive Race app. Users can register for races and create and build teams of runners. Features custom authentication and authorization schemes.

#### Build Frameworks

- [NodeJS](https://nodejs.org/en/)
- [Express](http://expressjs.com/)
- [Mongoose](http://mongoosejs.com/)
- [MongoDB](https://www.mongodb.com/)

#### Dependencies

- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [cors](https://www.npmjs.com/package/cors)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [validator](https://www.npmjs.com/package/validator)

#### Development Dependencies

- [morgan](https://www.npmjs.com/package/morgan)

#### Hosting

- [mLab](https://mlab.com/)
- [Heroku](https://heroku.com/)

### Project Objectives

These objectives are for the entire project. The goal was to create a database schema and API to support these objectives.

**Guests.**
- Guests can view static content about the current race.

**Users.**
- Users can register for an account and obtain an authentication token.
- Users can register for the current race and pay a fee.

**Runners.**
- Runners can view available teams for the current race.
- Runners can either create a team or join an existing team for the current race.
- Runners can leave their team for a different team, being prompted to transfer ownership if needed.
- Runners can communicate within teams and set a team meeting place for the race.
- Runners can view their own race results and results for their team.

**Admins.**
- Admin users can manage users, teams, races, and results.

### Setup

A development version of this app can be run by cloning the repository, installing dependencies, configuring and running the database as given in the following section, and then running the main server.

```
$ git clone https://github.com/jestann/jive-race-api.git <jive-race-api>
$ npm install
$ <configure and begin running the database here>
$ node main.js
```

This runs a development server on `process.env.PORT`. Server requests can then be simulated with [Postman](https://www.getpostman.com/).


### Configuration and Database Authentication

**Note:** This repository uses environment variables to populate the `config.js` file, which sets up json web token authentication and initializes against the mLab database.

To run this app, developers must create a `config.js` file with authentication information for their own authentication scheme and database system or populate environment variables as given in the existing `config.js`:

```
module.exports = {
    
    'secret': process.env.SECRET, // secret token for jwt
    'database': process.env.PROD_MONGODB // uri for connection to database

};
```

Once this file is correctly populated, the app will authenticate to the database. 

If mLab is being used, the `mongodb` console can either be accessed from the mLab dashboard or by running the following command with the appropriate config information substituted, as given by mLab.

```
mongo ds012345.mlab.com:56789/dbname -u dbuser -p dbpassword
```

The database must be running before starting the development server.

### File Structure

This app has the following file structure.

```
├── config
│   ├── config.js
│   └── ...
├── controllers
│   └── ...
├── models
│   └── ...
├── routes
│   └── ...
├── tools
│   └── ...
├── .gitignore
├── main.js
├── package-lock.json
├── package.json
└── README.md
```

### Future Development

- Accept payment for race registration via [Stripe](https://stripe.com/).
- Add data input validation with [validator](https://www.npmjs.com/package/validator).
- Prep data for being returned with custom sanitizer method.
- Add [Slack](https://slack.com/) integration for team communication.

### Implementation

A live version of the app exists [here](https://jive-race-api.herokuapp.com).

### Visuals

The front-end respository for the Jive Race App exists [here](https://github.com/jestann/jive-race).