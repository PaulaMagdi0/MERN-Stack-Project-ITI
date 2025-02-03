import "./About.css"
import back from "../../assets/back.jpg"
import book from "../../assets/73a24e15cbe0c7a17b5d9a82837c82ec.jpg"
import background from "../../assets/965a493f279cfb106c2409a9d52dc473-removebg-preview.png"
import watch from "../../assets/watch-removebg-preview.png";

function AboutAs(params) {
    return ( 
        <>
            <search className="About">

                <div className="content-container">
                {/* <img src={watch} classNameName="watch" /> */}

                <h1 className="section-title">Welcome to Our Reading Community</h1>
                <br/>
                <p className="section-text">
                    Discover, share, and track your reading journey. Join our community of book lovers and explore hundreds of books.
                </p>
                
                <p className="section-text">
                    We are a fast-growing platform where you can find your next great read, rate books, write reviews, and connect with fellow readers. Whether you're into fiction, non-fiction, fantasy, or romance, there's a book for everyone.
                </p>
                </div>
                <div className="image_container">
                    <img src={back} className="image_back"/>
                    <img src={book} className="image2"/>
                </div>

            </search>

            <img src={background} className="backg"/>

        </>
    );

}
export default AboutAs;