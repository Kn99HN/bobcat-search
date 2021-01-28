import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { findInstructor } from "../utils";

import Drawer from "@material-ui/core/Drawer";
import grey from "@material-ui/core/colors/grey";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export default function Attributes({
  instructors,
  building,
  room,
  units,
  status, // eslint-disable-line no-unused-vars
  type,
  registrationNumber,
}) {
  const [instructorsWithRMP, setInstructorsWithRMP] = useState([]);
  const [currentInstructor, setCurrentInstructor] = useState({
    name: "",
    rmpId: "",
    page: 1,
    ratings: [],
    isMore: true,
    totatRatings: 0,
  });
  const [drawer, setDrawer] = useState(false);

  const onClickInstructor = async (instructor) => {
    try {
      if (instructor.rmpId === null) {
        setDrawer(false);
        return;
      }
      if (!drawer) {
        setCurrentInstructor({
          name: "",
          rmpId: "",
          page: 1,
          ratings: [],
        });
      }
      const resp = await fetch(
        `https://www.ratemyprofessors.com/paginate/professors/ratings?tid=${instructor.rmpId}&page=1`
      );
      if (!resp.ok) {
        console.log(`Error ${resp.status}`);
      }
      const jsonRatings = await resp.json();
      setCurrentInstructor({
        name: instructor.name,
        rmpId: instructor.rmpId,
        page: 1,
        isMore: jsonRatings.remaining === 0 ? false : true,
        ratings: [...currentInstructor.ratings, ...jsonRatings.ratings],
        totalRatings: jsonRatings.remaining + jsonRatings.ratings.length,
      });
      setDrawer(true);
    } catch (e) {
      console.log(e);
    }
  };

  const onLoadMore = async () => {
    const resp = await fetch(
      `https://www.ratemyprofessors.com/paginate/professors/ratings?tid=${
        currentInstructor.rmpId
      }&page=${currentInstructor.page + 1}`
    );
    if (!resp.ok) {
      console.log(`Error ${resp.status}`);
    }
    const moreRatings = await resp.json();
    setCurrentInstructor({
      ...currentInstructor,
      isMore: moreRatings.remaining === 0 ? false : true,
      page: currentInstructor.page + 1,
      ratings: [...currentInstructor.ratings, ...moreRatings.ratings],
    });
  };

  const onClose = () => {
    setDrawer(false);
  };

  useEffect(() => {
    (() => {
      const modifiedInstructors = instructors.map((instructor) =>
        findInstructor(instructor)
      );
      setInstructorsWithRMP(modifiedInstructors);
      console.log(modifiedInstructors);
    })();
  }, [instructors]);

  return (
    <div className="attributes">
      <React.Fragment>
        <Drawer anchor={"right"} open={drawer} onClose={onClose}>
          {
            <MetaContainer>
              <div>{currentInstructor.name}</div>
              <div>{`${currentInstructor.totalRatings} reviews`}</div>
            </MetaContainer>
          }
          <RatingGrid>
            <div style={{ width: "40vw" }}>
              <RatingContainer>
                <InfoContainer>Info</InfoContainer>
                <Comment style={{ textAlign: "center" }}>Comment</Comment>
              </RatingContainer>
            </div>
            {currentInstructor.ratings.length > 0 &&
              currentInstructor.ratings.map((rating) => {
                return (
                  <div key={rating.id} style={{ width: "40vw" }}>
                    <RatingContainer>
                      <InfoContainer>
                        <Rating>{rating.rClass}</Rating>
                        <Rating>{`Overall: ${rating.rOverall}`}</Rating>
                        <Rating>{`Helpful: ${rating.rHelpful}`}</Rating>
                      </InfoContainer>
                      <Comment>{rating.rComments}</Comment>
                    </RatingContainer>
                  </div>
                );
              })}
          </RatingGrid>
          {currentInstructor.isMore && (
            <ExpandButton onClick={onLoadMore}>
              <ExpandMoreIcon
                style={{
                  color: grey[700],
                }}
              />
              <span style={{ color: grey[700] }}>More Reviews</span>
            </ExpandButton>
          )}
        </Drawer>
      </React.Fragment>
      <AttributeContainer>
        <div className="attributeLabel">
          Instructor{instructorsWithRMP.length > 1 ? "s" : ""}
        </div>
        {instructorsWithRMP.map((instructor) => {
          return (
            <InstructorName
              key={instructor.name}
              clickable={instructor.rmpId ? true : false}
              onClick={() => onClickInstructor(instructor)}
            >
              {instructor.name}
            </InstructorName>
          );
        })}
      </AttributeContainer>
      <AttributeContainer>
        <div className="attributeLabel">Building</div>
        {building}
      </AttributeContainer>
      {room && (
        <AttributeContainer>
          <div className="attributeLabel">Room</div>
          {room}
        </AttributeContainer>
      )}
      <AttributeContainer>
        <div className="attributeLabel">Units</div>
        {units}
      </AttributeContainer>
      <AttributeContainer>
        <div className="attributeLabel">Type</div>
        {type}
      </AttributeContainer>
      <AttributeContainer>
        <div className="attributeLabel">Registration #</div>
        {registrationNumber}
      </AttributeContainer>
    </div>
  );
}

Attributes.propTypes = {
  instructors: PropTypes.array.isRequired,
  building: PropTypes.string.isRequired,
  room: PropTypes.string,
  units: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  registrationNumber: PropTypes.number.isRequired,
};

const AttributeContainer = styled.div`
  padding: calc(0.8vmin + 0.8rem);
  font-size: 1.5rem;
  color: var(--grey800);
  font-weight: bold;

  & > .attributeLabel {
    font-size: 1rem;
    font-family: var(--condensedFont);
    color: var(--grey700);
  }
`;

const MetaContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: calc(0.8vmin + 0.8rem);
  font-size: 1.5rem;
  color: var(--grey200);
  font-weight: bold;
  background: linear-gradient(
    167deg,
    var(--purpleMain) 21%,
    #712991 60%,
    rgba(135, 37, 144, 1) 82%
  );
`;

const RatingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
`;

const RatingContainer = styled.div`
  padding: 0.4rem;
  font-size: 1rem;
  color: var(--grey900);
  font-weight: bold;
  display: flex;
  background-color: var(--grey400);
  border-bottom: 1px solid;
  border-top: 1px solid;
  width: 100%;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 30%;
  text-align: left;
`;

const Rating = styled.div`
  padding: 0 0.4rem;
  margin: 0 0.2rem;
`;

const Comment = styled.div`
  padding: 0.5rem;
  margin: 0.2rem;
  border-left: 1px solid;
  width: 70%;
`;

const InstructorName = styled.div`
  cursor: ${(props) => (props.clickable ? "pointer" : "")};
  transition: 0.1s;

  :hover {
    color: ${(props) => (props.clickable ? grey[600] : "")};
  }
`;

const ExpandButton = styled.div`
  font-size: 1.1rem;
  width: 100%;
  padding: 0.8rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: ${grey[200]};
  transition: 0.1s;

  :hover {
    background-color: ${grey[300]};
  }

  & > svg {
    margin-right: 0.65rem;
  }
`;
