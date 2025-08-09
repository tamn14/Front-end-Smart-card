
async function my_Request(endpoint: string) {
    // truy van den duong dan 
    const response = await fetch(endpoint);
    // tra ve loi 
    if (!response.ok) {
        throw new Error(`Don't lollow endpoint ${endpoint}`);
    }
    // tra ve ok
    return response.json();

}
export default my_Request ; 