module.exports = {
    noToken:        { code: 403, body: "No token provided." },
    userNotFound:   { code: 400, body: "User not found." },
    wrongPassword:  { code: 400, body: "Wrong password." },
    notAuthorized:  { code: 403, body: "Not authorized." },
    raceNotFound:   { code: 400, body: "Race not found." },
    teamNotFound:   { code: 400, body: "Team not found." },
    itemNotFound:   { code: 400, body: "Item not found." },
    missingData:    { code: 400, body: "Missing required data." },
    defaultErr:     { code: 500, body: "Error." },
    make:           (error) => { return { success: false, code: error.code || 500, error: error.body || error } }
}