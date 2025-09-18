const Favorites = ({favorites, onFindCity, onRemoveCityFromFavorites}) => {

  console.log(favorites)

  return (
    favorites.length > 0 && (
      <div className="mt-5">
        <p className="font-medium">Saved Cities</p>
        <ul className="flex justify-center gap-5 mt-2">
          {favorites.map((s, i) => (
            <li className="relative" key={i}>
              <span
                onClick={() => {onFindCity(s)}}
              >
                <div className="badge badge-outline badge-primary transition cursor-pointer hover:bg-black hover:text-white hover:border-white px-5">{s}</div>
                <svg
                  onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCityFromFavorites(s);
                    }
                  }
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="absolute bg-orange-800 text-white rounded-full p-[1px] top-[-2px] right-[-4px] size-3 cursor-pointer hover:bg-[red] transition"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </span>
          </li>
          ))}
        </ul>
      </div>
    )
  );

}


export default Favorites;