const getConsentStatus =  ({consentStatus, userConsented}) => {
    if(userConsented !== undefined){
        return userConsented ? 'consented' : null
    }
    return consentStatus
}

export default getConsentStatus ;