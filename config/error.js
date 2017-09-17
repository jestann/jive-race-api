module.exports = {
    noToken:            { code: 403, body: "No token provided." },
    userNotFound:       { code: 400, body: "User not found." },
    wrongPassword:      { code: 400, body: "Wrong password." },
    notAuthorized:      { code: 403, body: "Not authorized." },
    raceNotFound:       { code: 400, body: "Race not found." },
    teamNotFound:       { code: 400, body: "Team not found." },
    itemNotFound:       { code: 400, body: "Item not found." },
    missingData:        { code: 400, body: "Missing required data." },
    transferOwnership:  { code: 400, body: "Transfer ownership for this team before creating a new team." },
    stillContainsData:  { code: 400, body: "Cannot delete item. Still contains linked data." },
    notOpen:            { code: 400, body: "Race not open for registration." },
    editsClosed:        { code: 400, body: "Cannot be changed. Editing period closed." },
    stillOnTeam:        { code: 400, body: "User still on a team and cannot leave race." },
    notOnTeam:          { code: 400, body: "User must join team first before being made owner." },
    runnerHasResult:    { code: 400, body: "Runner already has a result entered for this race." },
    defaultErr:         { code: 500, body: "Error." },
    make:               (error) => { return { success: false, code: error.code || 500, error: error.body || error } }
}