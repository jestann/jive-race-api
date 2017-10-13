const registrar = require('./registrar')

// REMEMBER WHICH FUNCTIONS ARE ASYNC: user.register, user.joinTeam, user.leaveTeam, and team.create.
const Authorizer = {
    user: {
        index: (user) =>                         { user.isMember() },
        create: (user) =>                        { user.isMember() },
        show: (user, userInstance) =>            { user.isMember() },
        updateSelf: (user, userInstance) =>      { (user.isMember() && user.id === userInstance.id) || user.isAdmin() },
        updateAdmin: (user, userInstance) =>     { user.isAdmin() },
        destroy: (user, userInstance) =>         { (user.isMember() && user.id === userInstance.id) || user.isAdmin() },
        races: (user, userInstance) =>           { user.isMember() },
        teams: (user, userInstance) =>           { user.isMember() },
        results: (user, userInstance) =>         { (user.isMember() && user.id === userInstance.id) || user.isAdmin() },
        register: async (user, userInstance) =>  { (user.isMember() && user.id === userInstance.id && await registrar.userIsCurrent(user)) || user.isAdmin() },
        unregister: (user, userInstance) =>      { user.isAdmin() }, // removes a user from a race
        joinTeam: async (user, userInstance) =>  { (user.isMember() && user.id === userInstance.id && await registrar.userIsCurrent(user)) || user.isAdmin() },
        leaveTeam: async (user, userInstance) => { (user.isMember() && user.id === userInstance.id && await registrar.userIsCurrent(user)) || user.isAdmin() },
        makeAdmin: (user, userInstance) =>       { user.isAdmin() },
        makeMember: (user, userInstance) =>      { user.isAdmin() },
        validSelfAttributes:                     ['email', 'username', 'password', 'firstName', 'lastName', 'bio', 'photo', 'birthdate', 'address', 'city', 'state', 'zip', 'phone'],
        validAdminAttributes:                    ['dateRegistered'],  // createdAt + updatedAt locked, others must be edited through corresponding routes
        requiredAttributes:                      ['email', 'username', 'password', 'role']  // add additional required attributes?
    },
         
    race: {
        index: (user) =>                { user.isMember() },
        create: (user) =>               { user.isAdmin() },
        show: (user, race) =>           { user.isMember() },
        update: (user, race) =>         { user.isAdmin() },
        destroy: (user, race) =>        { user.isAdmin() },
        runners: (user, race) =>        { (user.isMember() && user.isRunningRace(race)) || user.isAdmin() },
        teams: (user, race) =>          { (user.isMember() && user.isRunningRace(race)) || user.isAdmin() },
        results: (user, race) =>        { (user.isMember() && user.isRunningRace(race)) || user.isAdmin() },
        open: (user, race) =>           { user.isAdmin() },
        archive: (user, race) =>        { user.isAdmin() },
        setCoordinator: (user, race) => { user.isAdmin() },
        validAttributes:                ['year', 'name', 'description', 'date', 'startingLocation', 'endingLocation', 'coordinatorId'], // createdAt + upcatedAt locked
        requiredAttributes:             ['year', 'name', 'date']
    },
    
    team: {
        index: (user) =>                { user.isMember() },
        create: async (user) =>         { (user.isMember() && await registrar.userIsCurrent(user)) || user.isAdmin() },
        show: (user, team) =>           { (user.isMember() && user.isRunningRaceId(team.raceId)) || user.isAdmin() },
        update: (user, team) =>         { (user.isMember() && user.owns(team)) || user.isAdmin() },
        destroy: (user, team) =>        { (user.isMember() && user.owns(team)) || user.isAdmin() },
        members: (user, team) =>        { (user.isMember() && user.isOnTeam(team)) || user.isAdmin() },
        results: (user, team) =>        { (user.isMember() && user.isOnTeam(team)) || user.isAdmin() },
        transfer: (user, team) =>       { (user.isMember() && user.owns(team)) || user.isAdmin() },
        validAttributes:                ['name', 'ownerId', 'description', 'meetingLocation', 'slackChannel'], // raceId + createdAt + updatedAt locked
        requiredAttributes:             ['name', 'ownerId', 'raceId'] // for creation
    },
    
    result: {
        index: (user) =>                { user.isAdmin() },
        create: (user) =>               { user.isAdmin() },
        show: (user, result) =>         { (user.isMember() && user.id === result.runnerId) || user.isAdmin() },
        update: (user, result) =>       { user.isAdmin() },
        destroy: (user, result) =>      { user.isAdmin() },
        validAttributes:                ['time', 'note'], // raceId + runnerId + teamId + createdAt + updatedAt locked
        requiredAttributes:             ['raceId', 'runnerId', 'time']
    }
}

module.exports = Authorizer

// create a method or a route to return an array of required attributes?