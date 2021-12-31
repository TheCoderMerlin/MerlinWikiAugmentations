
/**
 * Sort an array or objects in reverse order by the given key
 * 
 * @param  {string} orderKey The key to sort by
 * @param  {object} a The first object
 * @param  {object} b The second object
 * @return {number}
 */
function reverseSort(orderKey, a, b)
{
    if (a[orderKey] > b[orderKey]) {
        return -1;
    } else if (a[orderKey] < b[orderKey]) {
        return 1;
    } else {
        return 0;
    }
}

export {
    reverseSort
}