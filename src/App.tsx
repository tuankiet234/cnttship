import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import Container from '@mui/material/Container'
import MenuItem from '@mui/material/MenuItem'
import * as React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import { getCurrentUser, initAuth, initThinBackend } from 'thin-backend'
import { ThinBackend } from 'thin-backend-react'
import { LocalCafe } from '@mui/icons-material'

// This needs to be run before any calls to `query`, `createRecord`, etc.
initThinBackend({
  // This url is different for each backend, this one points to 'vnptship'
  host: 'https://cnttship.thinbackend.app',
})

function App() {
  const pages = ['order', 'shop', 'category', 'item']

  const navigate = useNavigate()

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = (page: string) => {
    setAnchorElNav(null)
    navigate(page)
  }

  const [user, setUser] = React.useState<any>(null)
  initAuth().then(() => {
    getCurrentUser().then(setUser)
  })

  return (
    <ThinBackend requireLogin>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Homemd */}
            <LocalCafe
              sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
            ></LocalCafe>
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              CNTTSHIP
            </Typography>

            {/* Homesx */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>

              {/* Pagexs */}
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
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={() => handleCloseNavMenu(page)}>
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <LocalCafe
              sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
            ></LocalCafe>
            <Typography
              variant="h5"
              noWrap
              component="a"
              href=""
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              CNTTSHIP
            </Typography>

            {/* Pagemd */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => navigate(page)}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page}
                </Button>
              ))}
            </Box>

            {/* User Setting */}
            <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
              {user?.email}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Outlet></Outlet>
      </Container>
    </ThinBackend>
  )
}

export default App
