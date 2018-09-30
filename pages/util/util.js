import {NetInfo , Platform} from 'react-native'

export async function checkInternet() {
        if(Platform.OS == 'ios'){
                try {
                        const res = await fetch('https://google.com').catch((err) => {
                            console.log(err)
                          });
                        if (res.status === 200) return true;
                    } catch (e) {
                        return false;
                    }
                    return false;
        }
        else{
                return NetInfo.isConnected.fetch();
        }
        
}