import type { CardResponse } from "../Models/Response/CardResponse";
import my_Request from "./Request";

type KetQuaResponse = {
  ketqua: CardResponse[];
  tongSoTrang: number;
  soTheMotTrang: number;
};

const TotalCard = 4;

export async function getAllCard(page: number): Promise<KetQuaResponse> {
  const url = `http://localhost:8080/cards?page=${page - 1}&size=${TotalCard}`;
  return getResult(url);
}

export async function get1Card(): Promise<KetQuaResponse> {
  const url = "http://localhost:8080/cards?page=0&size=1";
  return getResult(url);
}



export async function findCard(keyWord: string, page: number): Promise<KetQuaResponse> {
  const trimmed = keyWord.trim();
  const encodedKeyword = encodeURIComponent(trimmed);

  const base = "http://localhost:8080/cards";
  const offset = page - 1;

  const url =
    trimmed === ""
      ? `${base}?page=${offset}&size=${TotalCard}`
      : `${base}/name/${encodedKeyword}?page=${offset}&size=${TotalCard}`;

  return getResult(url);
}

export async function getById(cardId: number): Promise<CardResponse | null> {
  const url: string = `http://localhost:8080/cards/id/${cardId}`;

  try {
    const response = await my_Request(url);
    const card = response?.result;
    return {
      cardId: card.cardId,
      name: card.name,
      description: card.description,
      price: card.price,
      url: card.url,
    };
  } catch (error) {
    console.error("Lỗi khi lấy sách theo ID:", error);
    return null;
  }
}



async function getResult(endpoint: string): Promise<KetQuaResponse> {
  const ketQua: CardResponse[] = [];

  try {
    const response = await my_Request(endpoint);

    // Bảo vệ nếu _embedded hoặc page không tồn tại
    const responseData = response?.result?.content ?? [];
    const tongSoTrang: number = response.result?.totalPages;
    const tongSoSach: number = response.result?.totalElements;


    for (const card of responseData) {
      ketQua.push({
        cardId: card.cardId,
        name: card.name,
        description: card.description,
        price: card.price,
        url: card.url,
      });
    }

    return { ketqua: ketQua, tongSoTrang, soTheMotTrang: tongSoSach };
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return { ketqua: [], tongSoTrang: 0, soTheMotTrang: 0 };
  }
}
