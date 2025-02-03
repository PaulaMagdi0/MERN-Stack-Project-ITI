import Header from "../../components/header/Header";
import About from "../../components/about/About";
import Main from "../../components/main/Main";
import AboutAs from "../../components/aboutas/About";
import Books from "../../components/populer_books/Books";
import Categories from "../../components/categioes/Categories";
import AuthorsCarousel from "../../components/populer_auther/Author";

function MainPage() {
    return (
    <>
    <Header/>
    <AboutAs/>
    <Main/>
    <Categories/>
    <Books/>
    <AuthorsCarousel/>
    </>
    );
    
}
export default MainPage;