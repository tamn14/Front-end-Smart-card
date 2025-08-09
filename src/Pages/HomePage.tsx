import Banner from "../Component/Banner";
import ListProducts from "../Products/ListProducts";
import Features from "./Components/Features";

interface homePageProps {
    tuKhoaTimKiem : string
}

const HomePages = ({tuKhoaTimKiem} : homePageProps) => {

    return (
        <div>
            <Banner /> 
            <ListProducts findKeyWord = {tuKhoaTimKiem}   />
            <Features />
        </div>

    );
};
export default HomePages