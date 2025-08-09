import { useEffect, useState } from "react";

import { findCard, getAllCard } from "../API/CardAPI";
import PhanTrang from "../Utils/PhanTrang";
import CardProps from "./Components/CardProps";
import type { CardResponse } from "../Models/Response/CardResponse";

interface ListProductProps {
    findKeyWord: string

}

const ListProducts = ({ findKeyWord }: ListProductProps) => {
    const [ListCard, setListCard] = useState<CardResponse[]>([]);
    const [LoadData, setLoadData] = useState(true);
    const [Error, setError] = useState(null);
    const [CurrentPage, setCurrentPage] = useState(1)
    const [TotalPage, setTotalPage] = useState(0)
    const [TotalCard, setTotalCard] = useState(0)

    useEffect(() => {
        setLoadData(true);
        const fetchData = (findKeyWord.trim() == " ")
            ? getAllCard(CurrentPage)
            : findCard(findKeyWord, CurrentPage);

        fetchData
            .then(cardData => {
                setListCard(cardData.ketqua);
                setTotalPage(cardData.tongSoTrang);
                setTotalCard(cardData.soTheMotTrang);
            })
            .catch(error => {
                setError(error.message);
            })
            .finally(() => {
                setLoadData(false);
            });
    }, [CurrentPage, findKeyWord]);
    
    const phanTrang = (trangHienTai: number) => setCurrentPage(trangHienTai)
    if (LoadData) {
        return (
            <div>
                <h1>
                    Dang tai du lieu
                </h1>
            </div>
        )
    }
    if (Error) {
        return (
            <div>
                <h1> Gap loi: {Error}</h1>
            </div>
        )
    }

    return (
        <div className="container col-8 mt-5">
            <h2 className="fw-bold text-primary display-5 text-center">Sản Phẩm</h2>
            <div className="row mt-4">
                {
                    
                    ListCard.map(card => (
                        <CardProps key={card.cardId} card={card} />

                    ))
                    
                }
            </div>
             <PhanTrang trangHienTai={CurrentPage}
                tongSoTrang={TotalPage}
                onClickTrang={phanTrang} />
            
        </div>
    );
};
export default ListProducts