import React from "react";

type PhanTrangProps = {
  trangHienTai: number;
  tongSoTrang: number;
  onClickTrang: (trang: number) => void;
};

const PhanTrang = ({ trangHienTai, tongSoTrang, onClickTrang }: PhanTrangProps) => {
  const taoDanhSachTrang = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (tongSoTrang <= 5) {
      for (let i = 1; i <= tongSoTrang; i++) pages.push(i);
    } else {
      pages.push(1);

      if (trangHienTai > 3) pages.push("...");

      const start = Math.max(2, trangHienTai - 1);
      const end = Math.min(tongSoTrang - 1, trangHienTai + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (trangHienTai < tongSoTrang - 2) pages.push("...");

      pages.push(tongSoTrang);
    }

    return pages;
  };

  const danhSachTrang = taoDanhSachTrang();

  return (
    <nav aria-label="Pagination">
      <ul className="pagination justify-content-center">
        {/* Prev button */}
        <li className={`page-item ${trangHienTai === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => trangHienTai > 1 && onClickTrang(trangHienTai - 1)}
          >
            «
          </button>
        </li>

        {/* Page buttons */}
        {danhSachTrang.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className={`page-item ${
              item === trangHienTai ? "active" : item === "..." ? "disabled" : ""
            }`}
          >
            {item === "..." ? (
              <span className="page-link">...</span>
            ) : (
              <button className="page-link" onClick={() => onClickTrang(Number(item))}>
                {item}
              </button>
            )}
          </li>
        ))}

        {/* Next button */}
        <li className={`page-item ${trangHienTai === tongSoTrang ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => trangHienTai < tongSoTrang && onClickTrang(trangHienTai + 1)}
          >
            »
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default PhanTrang;
