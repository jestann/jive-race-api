module.exports = {
    
    // create a method or a route to return an array of required attributes?
    
    user: {
        index: (user) =>                     { user.isMember() },
        create: (user) =>                    { user.isMember() },
        show: (user, userInstance) =>        { user.isMember() },
        updateSelf: (user, userInstance) =>  { (user.isMember() && user.id === userInstance.id) || user.isAdmin() },
        updateAdmin: (user, userInstance) => { user.isAdmin() },
        destroy: (user, userInstance) =>     { (user.isMember() && user.id === userInstance.id) || user.isAdmin() },
        races: (user, userInstance) =>       { user.isMember() },
        teams: (user, userInstance) =>       { user.isMember() },
        results: (user, userInstance) =>     { (user.isMember() && user.id === userInstance.id) || user.isAdmin() },
        register: (user, userInstance) =>    { (user.isMember() && user.id === userInstance.id) || user.isAdmin() },
        joinTeam: (user, userInstance) =>    { (user.isMember() && user.id === userInstance.id && user.current) || user.isAdmin() },
        makeAdmin: (user, userInstance) =>   { user.isAdmin() },
        makeMember: (user, userInstance) =>  { user.isAdmin() },
        validSelfAttributes:                 ['email', 'username', 'password', 'firstName', 'lastName', 'bio', 'photo', 'birthdate', 'address', 'city', 'state', 'zip', 'phone'],
        validAdminAttributes:                ['role', 'current', 'dateRegistered', 'currentTeam'],  // createdAt + updatedAt locked
        requiredAttributes:                  ['email', 'username', 'password']  // add additional required attributes?
    },
         
    race: {
        index: (user) =>                { user.isMember() },
        create: (user) =>               { user.isAdmin() },
        show: (user, race) =>           { user.isMember() },
        update: (user, race) =>         { user.isAdmin() },
        destroy: (user, race) =>        { user.isAdmin() },
        runners: (user, race) =>        { (user.isMember() && user.races.includes(race)) || user.isAdmin() },
        teams: (user, race) =>          { (user.isMember() && user.races.includes(race)) || user.isAdmin() },
        results: (user, race) =>        { (user.isMember() && user.races.includes(race)) || user.isAdmin() },
        validAttributes:                ['year', 'name', 'description', 'date', 'startingLocation', 'endingLocation', 'coordinator'], // createdAt + upcatedAT locked
        requiredAttributes:             ['year', 'name', 'date']
    },
    
    team: {
        index: (user) =>                { user.isMember() },
        create: (user) =>               { (user.isMember() && user.current) || user.isAdmin() },
        show: (user, team) =>           { (user.isMember() && user.current) || user.isAdmin() },
        update: (user, team) =>         { (user.isMember() && user === team.owner) || user.isAdmin() },
        destroy: (user, team) =>        { (user.isMember() && user === team.owner) || user.isAdmin() },
        members: (user, team) =>        { (user.isMember() && user.current) || user.isAdmin() },
        results: (user, team) =>        { (user.isMember() && user.currentTeam === team) || user.isAdmin() },
        transfer: (user, team) =>       { (user.isMember() && user === team.owner) || user.isAdmin() },
        validAttributes:                ['name', 'owner', 'race', 'description', 'meetingLocation', 'slackChannel'], // createdAt + updatedAt locked
        requiredAttributes:             ['name', 'owner', 'race']
    },
    
    result: {
        index: (user) =>                { user.isAdmin() },
        create: (user) =>               { user.isAdmin() },
        show: (user, result) =>         { (user.isMember() && user === result.runner) || user.isAdmin() },
        update: (user, result) =>       { user.isAdmin() },
        destroy: (user, result) =>      { user.isAdmin() },
        validAttributes:                ['race', 'team', 'runner', 'time', 'note'], // createdAt + updatedAt locked
        requiredAttributes:             ['race', 'team', 'runner', 'time']
    }
    
}
