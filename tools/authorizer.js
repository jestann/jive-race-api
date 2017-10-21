const registrar = require('./registrar')

const Authorizer = {
    user: {
        index: (user) =>                         ( user.isAdmin() ),
        create: (user) =>                        ( user.isAdmin() ), // use auth/register route for a guest to register as a new user
        show: (user, userInstance) =>            ( (user.isMember() && user.isSelf(userInstance)) || user.isAdmin() ),
        updateSelf: (user, userInstance) =>      ( (user.isMember() && user.isSelf(userInstance)) || user.isAdmin() ),
        updateAdmin: (user, userInstance) =>     ( user.isAdmin() ),
        destroy: (user, userInstance) =>         ( (user.isMember() && user.isSelf(userInstance)) || user.isAdmin() ),
        races: (user, userInstance) =>           ( (user.isMember() && user.isSelf(userInstance)) || user.isAdmin() ),
        teams: (user, userInstance) =>           ( (user.isMember() && user.isSelf(userInstance)) || user.isAdmin() ),
        results: (user, userInstance) =>         ( (user.isMember() && user.isSelf(userInstance)) || user.isAdmin() ),
        register: (user, userInstance) =>        ( (user.isMember() && user.isSelf(userInstance)) || user.isAdmin() ),
        unregister: (user, userInstance) =>      ( user.isAdmin() ), // removes a user from a race
        joinTeam: (user, userInstance) =>        ( (user.isMember() && user.isSelf(userInstance) && user.isCurrent) || user.isAdmin() ),
        leaveTeam: (user, userInstance) =>       ( (user.isMember() && user.isSelf(userInstance) && user.isCurrent) || user.isAdmin() ),
        makeAdmin: (user, userInstance) =>       ( user.isAdmin() ),
        makeMember: (user, userInstance) =>      ( user.isAdmin() ),
        validSelfAttributes:                     ['email', 'username', 'password', 'firstName', 'lastName', 'bio', 'photo', 'birthdate', 'address', 'city', 'state', 'zip', 'phone'],
        validAdminAttributes:                    ['dateRegistered'],  // createdAt + updatedAt locked, others must be edited through corresponding routes
        requiredAttributes:                      ['email', 'username', 'password', 'role']  // add additional required attributes?
    },
         
    race: {
        index: (user) =>                ( user.isMember() ),
        create: (user) =>               ( user.isAdmin() ),
        show: (user, race) =>           ( user.isMember() ),
        update: (user, race) =>         ( user.isAdmin() ),
        destroy: (user, race) =>        ( user.isAdmin() ),
        runners: (user, race) =>        ( (user.isMember() && user.isRunningRace(race)) || user.isAdmin() ), // should sanitize runner objects 
        teams: (user, race) =>          ( (user.isMember() && user.isRunningRace(race)) || user.isAdmin() ), // should sanitize team objects
        results: (user, race) =>        ( (user.isMember() && user.isRunningRace(race)) || user.isAdmin() ), // should sanitize result objects
        open: (user, race) =>           ( user.isAdmin() ),
        archive: (user, race) =>        ( user.isAdmin() ),
        setCoordinator: (user, race) => ( user.isAdmin() ),
        validAttributes:                ['year', 'name', 'description', 'date', 'startingLocation', 'endingLocation'], // createdAt + upcatedAt locked, coordinatorId has own route
        requiredAttributes:             ['year', 'name', 'date']
    },
    
    team: {
        index: (user) =>                ( user.isMember() ),
        create: (user) =>               ( (user.isMember() && user.isCurrent) || user.isAdmin() ),
        show: (user, team) =>           ( (user.isMember() && user.isCurrentRaceOfTeam(team)) || user.isAdmin() ),
        update: (user, team) =>         ( (user.isMember() && user.owns(team)) || user.isAdmin() ),
        destroy: (user, team) =>        ( (user.isMember() && user.owns(team)) || user.isAdmin() ),
        members: (user, team) =>        ( (user.isMember() && user.isOnTeam(team)) || user.isAdmin() ), // should sanitize member objects
        results: (user, team) =>        ( (user.isMember() && user.isOnTeam(team)) || user.isAdmin() ), // should sanitize result objects
        transfer: (user, team) =>       ( (user.isMember() && user.owns(team)) || user.isAdmin() ),
        validAttributes:                ['name', 'description', 'meetingLocation', 'slackChannel'], // raceId + createdAt + updatedAt locked, use transfer for ownerId
        requiredAttributes:             ['name', 'ownerId', 'raceId'] // for creation
    },
    
    result: {
        index: (user) =>                ( user.isAdmin() ),
        create: (user) =>               ( user.isAdmin() ),
        show: (user, result) =>         ( (user.isMember() && user.ownsResult(result)) || user.isAdmin() ),
        update: (user, result) =>       ( user.isAdmin() ),
        destroy: (user, result) =>      ( user.isAdmin() ),
        validAttributes:                ['time', 'note'], // raceId + runnerId + teamId + createdAt + updatedAt locked
        requiredAttributes:             ['raceId', 'runnerId', 'time']
    }
}

module.exports = Authorizer

// create a method or a route to return an array of required attributes?