import React from "react";
import { connect, styled } from "frontity";

// Diese Komponente rendert einen Schalter zum togglen zwischen Listansichten 'Excerpt' und 'Fullview'
const ToggleViewmode = ({ actions, state }) => {
    const { setFullView, setStandardView } = actions.theme;
    const { viewmode } = state.theme;

    return (
        <Container>
            <ButtonsStyled isSelected={ viewmode === 'standardView' } onClick={ setStandardView }>Excerpt-View</ButtonsStyled>
            <ButtonsStyled isSelected={ viewmode === 'fullView' } onClick={ setFullView }>Full-View</ButtonsStyled>
        </Container>
    )
}

export default connect(ToggleViewmode);

const Container = styled.div`
    display: flex;
`;

const ButtonsStyled = styled.button`
    padding: 10px;
    border: 0;
    background-color: ${({ isSelected }) => (isSelected ? '#ccc': '#fff')};
`;
