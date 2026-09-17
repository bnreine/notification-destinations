const getConsentStatus =  ({ userConsented}) => {
    return userConsented ? 'consented' : null
}

export default getConsentStatus ;