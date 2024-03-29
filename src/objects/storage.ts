import * as LocalForage from 'localforage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
 
export class Storage {
 
    dbPromise: Promise<LocalForage>;
 
    constructor(){
 
        this.dbPromise = new Promise((resolve, reject) => {
 
            let db: LocalForage;
 
            let config = {
                name: '_dustpunchstorage',
                storeName: '_dustpunchkv',
                driverOrder: ['sqlite', 'indexeddb', 'websql', 'localstorage']
            }
 
            LocalForage.defineDriver(CordovaSQLiteDriver).then(() => {
                db = LocalForage.createInstance(config);
            })
                .then(() => db.setDriver(this.getDriverOrder(config.driverOrder)))
                .then(() => {
                    resolve(db);
                })
                .catch(reason => {
                    reject(reason)
                });
        }); 
    }
 
    ready(): Promise<any> {
        return this.dbPromise;
    }
 
    getDriverOrder(driverOrder){
 
        return driverOrder.map((driver) => {
 
            switch(driver){
                case 'sqlite':
                    return CordovaSQLiteDriver._driver;
                case 'indexeddb':
                    return LocalForage.INDEXEDDB;
                case 'websql':
                    return LocalForage.WEBSQL;
                case 'localstorage':
                    return LocalForage.LOCALSTORAGE;
            }
 
        });
 
    }
 
    get(key: string): Promise<any> {
        return this.dbPromise.then(db => db.getItem(key));
    }
 
    set(key: string, value: any): Promise<any> {
        return this.dbPromise.then(db => db.setItem(key, value));
    }
 
    remove(key: string): Promise<any> {
        return this.dbPromise.then(db => db.removeItem(key));
    }
 
    clear(): Promise<any> {
        return this.dbPromise.then(db => db.clear());
    }

    keys(): Promise<string[]> {
        return this.dbPromise.then(db => db.keys());
    }
 
}