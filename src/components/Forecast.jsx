import React from "react";
import { iconUrlFromCode } from "../services/weatherService";

function Forecast({ title, items, dailyClick }) {
  console.log(items);
  return (
    <div>
      <div className="flex items-center justify-start mt-6">
        <p className="text-white font-medium uppercase">{title}</p>
      </div>
      <hr className="my-2" />

      <div className="flex flex-row items-center justify-between text-white scrollbar scrollbar-thumb-gray scrollbar-track-gray overflow-x-auto">

        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center mx-6"
            style={{cursor: 'pointer'}}
            onClick={() => dailyClick ? dailyClick(item) : console.log('hourly clicked')}
          >
            <p className="font-light text-sm">{item.title}</p>
            <img
              src={iconUrlFromCode(item.icon)}
              className="w-12 my-1"
              alt=""
            />
            <p className="font-medium">{`${item.temp.toFixed()}°`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Forecast;