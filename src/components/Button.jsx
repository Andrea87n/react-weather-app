import { IconDark, IconLight } from "../icons/ThemeIcons.jsx";


const Button = ({themeStyle, onToggleTheme}) => {

  return (
    <button className={`btn btn-square p-1 ${themeStyle === 'dark' ? 'border-white' : 'border-black'}`} onClick={onToggleTheme}>
      <div className="theme-icon w-6 h-6">
        {themeStyle === 'silk' ? <IconLight /> : <IconDark />}
      </div>
    </button>
  );


}

export default Button;