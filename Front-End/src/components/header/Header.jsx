import "./Header.css";
import headerImage from "../../assets/header3-removebg-preview.png";
import cadil from "../../assets/candil-removebg-preview.png";
import flower from "../../assets/header4-removebg-preview.png";
function Header() {
    return(
        <>
        <header className="header">
            <div className="header-text">
            <h1>Choose your book<br/> and let the story begin!</h1>
            </div >
            <div>
            <img src={flower} className="flower"/>
            <img src={headerImage} alt="header_image" className="imageheader"/>
            <img src={cadil} className="extra-image"/>
            </div>

        </header>
        </>
    );
    
}
export default Header;