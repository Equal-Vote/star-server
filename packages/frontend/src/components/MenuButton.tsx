import { StyledButton } from '~/components/styles';
import { useState, useEffect } from 'react';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Menu, { menuClasses } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
interface MenuButtonProps {
    menuItems: React.ReactElement<typeof MenuItem>[];
    label: React.ReactNode;
}

export function MenuButton({ menuItems: children, label }: MenuButtonProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    return (
        <div>
            <StyledButton
                aria-controls="simple-menu"
                aria-haspopup="true"
                type='button'
                variant='contained'
                fullwidth
                onClick={(event) => setAnchorEl(event.currentTarget)}
                endIcon={
                    <ExpandMoreIcon
                        sx={{
                            userSelect: "none",
                            pointerEvents: "none",
                            transform: anchorEl ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                    />
                }
            >
                {label}
            </StyledButton>
            <Menu
                id="simple-menu"
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                keepMounted
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                sx={{
                    [`& .${menuClasses.paper}`]: {
                        minWidth: 140,
                        borderRadius: "4px",
                        marginTop: "8px",
                    },
                }}
            >
                {children}
            </Menu>
        </div>
    );
}