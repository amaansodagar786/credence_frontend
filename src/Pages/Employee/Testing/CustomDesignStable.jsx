import React from "react";
import "./CustomDesignStable.scss";
import ringSketch from "../../../assets/images/home/custom1.png";
import mensJewelry from "../../../assets/images/home/custom2.png";

const CustomDesignStable = () => {
  return (
    <div className="custom-design-stable">

      {/* ---------- CUSTOM DESIGN ---------- */}
      <section className="cds-section cds-custom">
        <div className="cds-inner">

          <div className="cds-content">
            <p className="cds-subtitle">CUSTOM DESIGN</p>

            <h2 className="cds-title">
              Design Your Unique <br /> Masterpiece with us
            </h2>

            <p className="cds-desc">
              At Gemsparx, we believe your jewelry should be as unique as you are.
              With our ‘Create Your Own Design’ feature powered by advanced CAD
              technology, you can transform your concept or sketch into stunning,
              one-of-a-kind pieces that reflect your style and story.
            </p>

            <button className="cds-btn">Know More</button>
          </div>

          <div className="cds-image">
            <img src={ringSketch} alt="Ring Sketch" />
          </div>

        </div>
      </section>

      {/* ---------- MENS JEWELRY ---------- */}
      <section className="cds-section cds-mens">
        <div className="cds-inner">

          <div className="cds-image">
            <img src={mensJewelry} alt="Mens Jewelry" />
          </div>

          <div className="cds-content">
            <p className="cds-subtitle">MENS JEWELRY</p>

            <h2 className="cds-title">
              Crafted For <br /> The Modern Man
            </h2>

            <p className="cds-desc">
              Today’s man doesn’t follow trends—he sets them. With Gemsparx curated
              jewelry collection, elevate your style and make a bold refined statement.
            </p>

            <ul className="cds-list">
              <li>Rings</li>
              <li>Bracelet</li>
              <li>Pendants</li>
              <li>Bands</li>
            </ul>

            <button className="cds-btn">FIND YOURS TODAY</button>
          </div>

        </div>
      </section>

    </div>
  );
};

export default CustomDesignStable;
