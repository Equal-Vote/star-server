import React, { useState } from "react"
import ShareIcon from '@mui/icons-material/Share';
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import { makeStyles } from "@mui/material/styles"
import Button from "@mui/material/Button"
import Popper from "@mui/material/Popper"
import Fade from "@mui/material/Fade"
import Paper from "@mui/material/Paper"
import FacebookIcon from "@mui/icons-material/Facebook"
import { X } from "@mui/icons-material";
import RedditIcon from "@mui/icons-material/Reddit"
import LinkIcon from "@mui/icons-material/Link"
import { IconButton, Menu, Tooltip, Typography } from "@mui/material";
import { PrimaryButton, SecondaryButton } from "../styles";
import useSnackbar from "../SnackbarContext";
import { useSubstitutedTranslation } from "../util";

export default function ShareButton({ url }) {
    const { snack, setSnack } = useSnackbar()
    const [anchorElNav, setAnchorElNav] = useState(null)

    const {t} = useSubstitutedTranslation();

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleShare = e => {
        e.preventDefault()

        const ahref = url
        const encodedAhref = encodeURIComponent(ahref)
        let link

        switch (e.currentTarget.id) {
            case "facebook":
                link = `https://www.facebook.com/sharer/sharer.php?u=${ahref}`
                open(link)
                break

            case "X":
                link = `https://x.com/intent/tweet?url=${encodedAhref}`
                open(link)
                break

            case "reddit":
                link = `https://www.reddit.com/submit?url=${encodedAhref}`
                open(link)
                break

            case "copy":
                navigator.clipboard.writeText(ahref)
                setSnack({
                    message: t('share.link_copied'),
                    severity: 'success',
                    open: true,
                    autoHideDuration: 6000,
                })
                break

            default:
                break
        }
    }

    const open = socialLink => {
        window.open(socialLink, "_blank")
    }

    return (
        <>
            <SecondaryButton
                fullWidth
                onClick={handleOpenNavMenu}>
                {t('share.button')}
            </SecondaryButton>
            <Fade timeout={350}>
                <Paper >
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorElNav}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}>
                        <ListItem
                            button
                            id="facebook"
                            onClick={handleShare}
                        >
                            <ListItemIcon>
                                <FacebookIcon />
                            </ListItemIcon>
                            <ListItemText primary={t('share.facebook')}/>
                        </ListItem>
                        <ListItem
                            button
                            id="X"
                            onClick={handleShare}
                        >
                            <ListItemIcon>
                                <X />
                            </ListItemIcon>
                            <ListItemText primary={t('share.X')}/>
                        </ListItem>
                        <ListItem
                            button
                            id="reddit"
                            onClick={handleShare}
                        >
                            <ListItemIcon>
                                <RedditIcon />
                            </ListItemIcon>
                            <ListItemText primary={t('share.reddit')}/>
                        </ListItem>
                        <ListItem
                            button
                            id="copy"
                            onClick={handleShare}
                        >
                            <ListItemIcon>
                                <LinkIcon />
                            </ListItemIcon>
                            <ListItemText primary={t('share.copy_link')}/>
                        </ListItem>
                    </Menu>
                </Paper>
            </Fade>
        </>

    )
}