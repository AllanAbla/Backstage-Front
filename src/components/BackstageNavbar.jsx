// src/components/BackstageNavbar.jsx
import { useLocation, useNavigate } from "react-router-dom";
import StaggeredMenu from "./StaggeredMenu.jsx";

const menuItems = [
  { label: "Home", ariaLabel: "Ir para página inicial", link: "/" },
  { label: "Teatros", ariaLabel: "Gerenciar teatros", link: "/theaters" },
  { label: "Performances", ariaLabel: "Gerenciar performances", link: "/performances" },
  { label: "Mapa", ariaLabel: "Ver teatros no mapa", link: "/map" },
];

const socialItems = [
  { label: "GitHub", link: "https://github.com" },
  { label: "Twitter", link: "https://twitter.com" },
];

export default function BackstageNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectItem = (item) => {
    if (!item?.link) return;
    if (item.link === location.pathname) return;
    navigate(item.link);
  };

  return (
    <StaggeredMenu
      position="right"
      items={menuItems}
      socialItems={socialItems}
      displaySocials={false}
      displayItemNumbering={true}
      menuButtonColor="#e8eef3"
      openMenuButtonColor="#e8eef3"
      changeMenuColorOnOpen={true}
      colors={["#171e25", "#4aa8ff"]}
      logoUrl=""             
      accentColor="#4aa8ff"
      isFixed={true} 
      onMenuOpen={() => {}}
      onMenuClose={() => {}}
      onSelectItem={handleSelectItem}
    />
  );
}
