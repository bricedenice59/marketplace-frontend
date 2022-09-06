const storeData = (id, courseItem) => {
    try {
        localStorage.setItem(id, courseItem);
        return true;
    } catch (error) {
        // Error saving data
        console.log(error);
        return false;
    }
};

const retrieveData = (id) => {
    try {
        const value = localStorage.getItem(id);
        return value;
    } catch (error) {
        // Error retrieving data
        return null;
    }
};

const deleteData = (id) => {
    try {
        localStorage.removeItem(id);
        return true;
    } catch (error) {
        console.log(error);
        // Error removing data
        return false;
    }
};

module.exports = {
    deleteData,
    retrieveData,
    storeData,
};
