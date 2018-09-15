import {NetInfo} from 'react-native'

export async function checkInternet() {
        return NetInfo.isConnected.fetch();
}