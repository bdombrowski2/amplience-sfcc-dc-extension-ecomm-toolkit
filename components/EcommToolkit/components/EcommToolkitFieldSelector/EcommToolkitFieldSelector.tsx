import React, { useEffect, useState } from 'react'
// import './App.css';
import Stack from '@mui/material/Stack'

import {Cta} from '../Cta/Cta'

import {AmplienceSDK, initAmplienceSDK} from '../../lib/sdk'
import { Typography, Divider, Dialog, Card, CardContent } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
   "fontFamily": `"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,   
  },
  palette:{
    primary:{
      main: '#0374dd',
      light: '#ecf1fc',
      dark: '#b4bef2'
    },
    secondary:{
      main: '#ecf1fc',
      light: '#ecf1fc',
      dark: '#b4bef2'
    }
  }
});


export default function EcommToolkitFieldSelector() {
    const [ampSDK, setAmpSDK] = useState<AmplienceSDK>(undefined)
    const [errorText, setErrorText] = useState<any>(undefined)

    useEffect(() => {
        initAmplienceSDK().then(setAmpSDK).catch((e) => setErrorText(e.message))
    }, [ampSDK])

    let component = <>
        <CircularProgress />
        <div>Loading View..</div>
    </>

    if (errorText) {
        component = <Dialog open={true}>
            <Card variant='outlined'>
                <CardContent style={{whiteSpace: "pre-wrap"}}>{errorText}</CardContent>
            </Card>
        </Dialog>
    } else if (ampSDK?.fieldType === 'cta') {
        component = <Cta ampSDK={ampSDK} />
    }

    return (
        <ThemeProvider theme={theme}>
        <div className='App'>
            <Stack spacing={0} sx={{ width: '100%' }}>
                {
                    ampSDK?.getTitle() &&
                    <Typography variant='body1' color={'#002C42'} sx={{fontWeight:700}}>{ampSDK?.getTitle()}</Typography>
                }
                {
                    ampSDK?.getDescription() &&
                    <Typography variant='caption' color={'#597684'}>{ampSDK?.getDescription()}</Typography>
                }
                {
                    (ampSDK?.getDescription() || ampSDK?.getTitle()) &&
                    <Divider sx={{marginTop:1, marginBottom:1, borderColor:'#d6dff8'}} variant="fullWidth"></Divider>
                }
                {component}
            </Stack>
        </div>
    </ThemeProvider>
    )
}

