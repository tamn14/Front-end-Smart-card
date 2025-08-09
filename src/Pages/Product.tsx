import ListProducts from "../Products/ListProducts";

interface ProductProp {
    tuKhoaTimKiem : string
}

const Products = ({tuKhoaTimKiem} : ProductProp) => {
    
    return (
        <div>
            
            <ListProducts findKeyWord = {tuKhoaTimKiem}   />
            
        </div>

    );
}
export default Products ; 

