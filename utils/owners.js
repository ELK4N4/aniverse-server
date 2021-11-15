const get = () => {
    return process.env.OWNERS.split(',');
};

const find = (userId) => {
    return get().find(owner => userId.equals(owner))
}

const isOwner = (userId) => {
    if(find(userId)) {
        return true;
    } else {
        return false;
    }
}

export default { get, find, isOwner };