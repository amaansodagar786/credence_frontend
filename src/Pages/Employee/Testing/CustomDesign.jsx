import React from "react";
import "./CustomDesign.scss";
import ringSketch from "../../../assets/Images/home/custom1.png";
import mensJewelry from "../../../assets/images/Home/custom2.png";

const CustomDesign = () => {
    return (
        <div className="custom-design-wrapper">
            {/* ---------- CUSTOM DESIGN SECTION ---------- */}
            <section className="custom-design-section">
                <div className="section-inner">
                    <div className="content">
                        <p className="subtitle">CUSTOM DESIGN</p>
                        <h2>
                            Design Your Unique <br /> Masterpiece with us
                        </h2>
                        <p className="description">
                            At Gemsparx, we believe your jewelry should be as unique as you are.
                            With our ‘Create Your Own Design’ feature, powered by advanced CAD
                            (Computer-Aided Design) technology, you can transform your concept,
                            sketch, or inspiration into stunning, one-of-a-kind pieces that
                            reflect your style and story. If you can conceive it, we can create it.
                        </p>
                        <button className="btn">Know More</button>
                    </div>
                    <div className="image">
                        <img src={ringSketch} alt="Ring Sketch" />
                    </div>
                </div>
            </section>

            {/* ---------- MENS JEWELRY SECTION ---------- */}
            <section className="mens-jewelry-section">
                <div className="section-inner">
                    <div className="image">
                        <img src={mensJewelry} alt="Men's Jewelry" />
                    </div>
                    <div className="content">
                        <p className="subtitle">MENS JEWELRY</p>
                        <h2>
                            Crafted For <br /> The Modern Man
                        </h2>
                        <p className="description">
                            Today’s man doesn’t follow trends—he sets them. With Gemsparx curated
                            jewelry collection, elevate your style and make a statement that’s
                            unapologetically you. Bold. Refined. Beyond the ordinary.
                        </p>
                        <ul className="category-list">
                            <li>Rings</li>
                            <li>Bracelet</li>
                            <li>Pendants</li>
                            <li>Bands</li>
                        </ul>
                        <button className="btn">FIND YOURS TODAY</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CustomDesign;
