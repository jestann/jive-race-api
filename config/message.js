module.exports = {
    saved:      "Saved successfully.",
    updated:    "Updated successfully.",
    destroyed:  "Deleted successfully.",
    success:    (dataName=null, data=null, message=null) => { 
        let result = { success: true, code: 200 }
        if (dataName && data) { result[dataName] = data }
        if (dataName && data && message) { result.message = message }
        if (dataName && !data && !message) { result.message = dataName }
        return result
    }
}