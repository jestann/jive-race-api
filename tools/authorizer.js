module.exports = {
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
        addResult: (user, userInstance) =>   { user.isAdmin() },
        validSelfAttributes:                 ['email', 'username', 'password', 'firstName', 'lastName', 'bio', 'photo', 'birthdate', 'address', 'city', 'state', 'zip', 'phone'],
        validAdminAttributes:                ['role', 'current', 'dateRegistered', 'currentTeam']  // createdAt + updatedAt locked
    },
         
    race: {
        index: (user) =>                { user.isMember() },
        create: (user) =>               { user.isAdmin() },
        show: (user, race) =>           { user.isMember() },
        update: (user, race) =>         { user.isAdmin() },
        destroy: (user, race) =>        { user.isAdmin() },
        teams: (user, race) =>          { user.isMember() && user.races.includes(race) },
        runners: (user, race) =>        { user.isMember() && user.races.includes(race) },
        results: (user, race) =>        { user.isMember() && user.races.includes(race) }
    },
    
    team: {
        index: (user) =>                { user.isMember() },
        create: (user) =>               { user.isMember() && user.current },
        show: (user, team) =>           { user.isMember() && user.currentTeam === team },
        update: (user, team) =>         { user.isMember() && user === team.owner },
        destroy: (user, team) =>        { user.isMember() && user === team.owner },
        results: (user, team) =>        { user.isMember() && user.currentTeam === team }
    },
    
    result: {
        index: (user) =>                { user.isAdmin() },
        create: (user) =>               { user.isAdmin() },
        show: (user, result) =>         { user.isMember() && user === result.runner },
        update: (user, result) =>       { user.isAdmin() },
        destroy: (user, result) =>      { user.isAdmin() },
    }
}
