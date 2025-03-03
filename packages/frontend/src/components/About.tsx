import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { PrimaryButton } from "./styles";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSubstitutedTranslation } from "./util";

const About = () => {
  const {t} = useSubstitutedTranslation('election');

  return (
    <Container>
      <Paper
        elevation={6}
        sx={{
          margin: "auto",
          maxWidth: "1300px",
          marginTop: "4rem",
          marginBottom: "8rem",
          padding: "1rem 2rem 2rem 2rem",
        }}
      >
        <h1>{t('about.title')}</h1>

        <Typography>
          {t('about.description')}
        </Typography>

        <h1>{t('about.team_title')}</h1>
        <h2>{t('about.leads_title')}</h2>
        <ul>{t('about.leads').map(content => <li>{content}</li>)}</ul>

        <h2>{t('about.contributors_title')}</h2>
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          gap="10px"
          sx={{ maxWidth: 800 }}
        >
          {t('about.contributors').map(({github_user_name, github_image_id}) => (
            <a href={`https://github.com/${github_user_name}`}>
              <Box
                component="img"
                src={`https://avatars.githubusercontent.com/u/${github_image_id}?v=4`}
                sx={{ borderRadius: "100%", width: 80, heigth: 80 }}
              />
            </a>
          ))}
        </Box>

        <h1>{t('about.contribute_title')}</h1>
        <Typography>
          {t('about.contribute_description')}
        </Typography>

        <h1>{t('about.donate_title')}</h1>
        <Typography>
          {t('about.donate_description')}
        </Typography>

        <PrimaryButton sx={{m: 3}} href={t('about.donate_link')}>
          {t('about.donate_button')}
        </PrimaryButton>
      </Paper>
    </Container>
  );
};

export default About;
