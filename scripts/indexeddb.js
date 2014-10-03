if (!window.storageEngine) {
    storageEngine = function() {
        var database;

        return {
            init: function(successCallback, errorCallback) {
                if (window.indexedDB) {
                    var request = indexedDB.open(window.location.hostname+'DB');
                    request.onsuccess = function(event) {
                        database = request.result;
                        successCallback(null);
                    }
                    request.onerror = function(event) {
                        errorCallback('storage_not_initialized', 'Error in initializing storage');
                    }
                } else {
                    errorCallback('storage_api_not_supported', 'The web storage api is not supported');
                }
            },

            initObjectStore: function(type, successCallback, errorCallback) {
                if (!database) {
                    errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
                } else {
                    var exists = false;
                    $.each(database.objectStoreNames, function(i, v) {
                        if (v === type) { exists = true; }
                    });
                    if (exists) {
                        successCallback(null);
                    } else {
                        var version = database.version + 1;
                        database.close();
                        var request = indexedDB.open(window.location.hostname+'DB', version);
                        request.onsuccess = function(event) {
                            successCallback(null);
                        }
                        request.onerror = function(event) {
                            errorCallback('storage_api_not_initialized', 'The object storage cannot be initialized');
                        }
                        request.onupgradeneeded = function(event) {
                            database = event.target.result;
                            var objectStore = database.createObjectStore(type, {keyPath: 'id', autoIncrement: true});
                        }
                    }
                }
            },

            save: function(type, obj, successCallback, errorCallback) {
                if (!database) {
                    errorCallback('storage_api_not_initialized', 'The storage engine has not been initiailized');
                } else {
                    if (!obj.id) {
                        delete obj.id;
                    } else {
                        obj.id = parseInt(obj.id);
                    }
                    var trans = database.transaction([type], 'readwrite');
                    trans.oncomplete = function(event) {
                        successCallback(obj);
                    }
                    trans.onerror = function(event) {
                        errorCallback('transaction_error', 'Transaction failed while saving object');
                    }
                    var objectStore = trans.objectStore(type);
                    var request = objectStore.put(obj);
                    request.onsuccess = function(event) {
                        obj.id = event.target.result;
                    }
                    request.onerror = function(event) {
                        errorCallback('object_not_stored', 'Saving object failed');
                    }
                }
            },

            findAll: function(type, successCallback, errorCallback) {
                if (!database) {
                    errorCallback('storage_api_not_initialized', 'The storage engine has not been initiailized');
                } else {
                    var result = [];
                    var trans = database.transaction([type]);
                    var objectStore = trans.objectStore(type);
                    objectStore.openCursor().onsuccess = function(event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            result.push(cursor.value);
                            cursor.continue();
                        } else {
                            successCallback(result);
                        }
                    }
                }
            },

            delete: function(type, id, successCallback, errorCallback) {
                if (!database) {
                    errorCallback('storage_api_not_initialized', 'The storage engine has not been initiailized');
                } else {
                    var obj = { id: id };
                    var trans = database.transaction([type], 'readwrite');
                    trans.oncomplete = function(event) {
                        successCallback(id);
                    }
                    trans.onerror = function(event) {
                        errorCallback('object_not_found', 'Object with id '+id+' not found');
                    }
                    var objectStore = trans.objectStore(type);
                    var request = objectStore.delete(id);
                    request.onsuccess = function(event) {
                    }
                    request.onerror = function(event) {
                        errorCallback('object_not_found', 'Object with id '+id+' not found');
                    }
                }
            },

            findByProperty: function(type, propertyName, propertyValue, successCallback, errorCalback) {
                if (!database) {
                    errorCallback('storage_api_not_initialized', 'The storage engine has not been initiailized');
                } else {
                    var result = [];
                    var trans = database.transaction([type]);
                    var objectStore = trans.objectStore(type);
                    objectStore.openCursor().onsuccess = function(event) {
                        var cursor = event.target.result();
                        if (cursor) {
                            if (cursor.value[propertyName] === propertyValue) {
                                result.push(cursor.value);
                            }
                            cursor.continue();
                        } else {
                            successCallback(result);
                        }
                    }
                }
            },

            findByID: function(type, id, successCallback, errorCallback) {
                if (!database) {
                    errorCallback('storage_api_not_initialized', 'The storage engine has not been initiailized');
                } else {
                    var trans = database.transaction([type]);
                    var objectStore = trans.objectStore(type);
                    var request = objectStore.get(id);
                    request.onsuccess = function(event) {
                        successCallback(event.target.result);
                    }
                    request.onerror = function(event) {
                        errorCallback('object_not_found', 'Object with id '+id+' not found');
                    }
                }
            },
        }
    }();
}
