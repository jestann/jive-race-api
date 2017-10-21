module.exports = {
    loggedIn:       "Logged in successfully.",
    loggedOut:      "Logged out successfully.",
    created:        "Created successfully.",
    saved:          "Saved successfully.",
    updated:        "Updated successfully.",
    destroyed:      "Deleted successfully.",
    registered:     "Registered successfully.",
    unregistered:   "Unregistered successfully.",
    joined:         "Joined successfully.",
    leftTeam:       "Left team successfully.",
    transferred:    "Ownership transferred successfully.",
    added:          "Added successfully.",
    removed:        "Removed successfully.",
    opened:         "Race opened for registration.",
    archived:       "Race closed for registration and current team reset for all its runners.",
    inactivated:    "User inactivated successfully.",
    success:        (dataName=null, data=null, message=null) => { 
        let result = { success: true, code: 200 }
        if (dataName && data) { result[dataName] = data }
        if (dataName && data && message) { result.message = message }
        if (dataName && !data && !message) { result.message = dataName }
        return result
    }
}