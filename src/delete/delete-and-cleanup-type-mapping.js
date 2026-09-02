import slackDeleteAndCleanup from './slack-delete-and-cleanup.js'
import smsDeleteAndCleanup from './sms-delete-and-cleanup.js'


const deleteAndCleanupTypeMapping = {
    slack: slackDeleteAndCleanup,
    sms: smsDeleteAndCleanup,
    whatsapp: smsDeleteAndCleanup,
    default: async ()=> {}
}

export default deleteAndCleanupTypeMapping;