const getMetadata = ({metadata = {}, phoneNumber}) => {
    if(phoneNumber){
        return {phoneNumber}
    }
    return metadata
}

export default getMetadata