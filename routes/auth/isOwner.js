export default function (user) {
    if(user.role.includes('owner')) {
        return true;
    } else {
        return false;
    }
}