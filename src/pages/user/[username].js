// pages/user/[username].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import {
  Box, Button, Container, Stack, SvgIcon, Typography, Menu, MenuItem, Tabs, Tab, Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  TextField
} from '@mui/material';
import { ChromePicker } from 'react-color';
import Head from 'next/head';
import Emergencytable from './emergency-table';
import Householdtable from './household-table';
import { items } from './user-config';
import { latitude, longitude, offline } from '../../sections/customer/material-table';
import Dropdown from 'muicss/lib/react/dropdown';
import DropdownItem from 'muicss/lib/react/dropdown-item';
import Slider from '@mui/material/Slider';
import { usePathname } from 'next/navigation';
import { SideNavItem } from 'src/layouts/dashboard/side-nav-item';
import WarningIcon from '@mui/icons-material/Warning';
import PropTypes from 'prop-types';
import Homehublogtable from './[username]/homehublog-table';
import Homehuberrortable from './[username]/homehuberror-table';
import Beaconlogtable from './[username]/beaconlog-table';
import Beaconerrortable from './[username]/beaconerror-table';
import Pucklogtable from './[username]/pucklog-table';
import Puckerrortable from './[username]/puckerror-table';
import axios from 'axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const UserPage = () => {
  const [userId, setUserId] = useState(null);
  const [brightness, setBrightness] = useState(50);
  const router = useRouter();
  const { username } = router.query;
  const pathname = usePathname();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabWidth = '10vw';

  const warningIconColor = username === 'Kumar' || username === 'C M' ? 'red' : 'rgb(255, 195, 0 )';

  const handleBrightnessChange = (event, newValue) => {
    setBeaconData((prevData) => ({
      ...prevData,
      brightness: newValue,
    }));
  };

  const handleClose = () => {
    setAnchorElHomeHub(null);
    setAnchorElBeacon(null);
    setAnchorElPuck(null);
  };

  const [beaconData, setBeaconData] = useState({
    color: { r: 0, g: 0, b: 0, a: 1 },
    brightness: 50,
    onTime: '',
    offTime: '',
    duration: '',
  });

  const [buzzerData, setBuzzerData] = useState({
    onTime: '',
    offTime: '',
    duration: '',
  });

  const handleColorChange = (color) => {
    setBeaconData((prevData) => ({
      ...prevData,
      color: color.rgb,
    }));
  };

  const [chargeControlData, setChargeControlData] = useState({
    minBatteryPercentage: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idToken = localStorage.getItem('idToken');
        const { username } = router.query;

        if (!username) {
          console.error('Username not provided in the URL.');
          return;
        }
        const response = await axios.get('https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/users/getUsers', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const user = response.data['AWS-result'].find(user => user.family_name === username);

        if (!user) {
          console.error(`User with username ${username} not found.`);
          return;
        }

        const obtainedUserId = user.sub;
        setUserId(obtainedUserId);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [username]);


  const handleSubmit = async () => {
    try {
      const idToken = localStorage.getItem('idToken');
      const apiUrl = 'https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/devices/storeDeviceProps/';

      const dataToSend = {
        user_id: userId,
        R: beaconData.color.r,
        G: beaconData.color.g,
        B: beaconData.color.b,
        brightness: beaconData.brightness,
        led_ON_TIME: beaconData.onTime,
        led_OFF_TIME: beaconData.offTime,
        led_DURATION: beaconData.duration,
        buzz_ON_TIME: buzzerData.onTime,
        buzz_OFF_TIME: buzzerData.offTime,
        buzz_DURATION: buzzerData.duration,
        charge_control: chargeControlData.minBatteryPercentage,
      };

      console.log('Data to send:', dataToSend);

      const response = await axios.post(apiUrl, dataToSend,
        {
          headers: {
              Authorization: `Bearer ${idToken}`,
              'Content-Type': 'application/json',
          },
      });
      console.log('API Response:', response);

      if (response.status !== 200) {
        throw new Error('Failed to save data');
      }
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };


  const handleInputChange = (event, section, field) => {
    const value = event.target.value;
    switch (section) {
      case 'beacon':
        setBeaconData((prevData) => ({
          ...prevData,
          [field]: value,
        }));
        break;
      case 'buzzer':
        setBuzzerData((prevData) => ({
          ...prevData,
          [field]: value,
        }));
        break;
      case 'chargeControl':
        setChargeControlData((prevData) => ({
          ...prevData,
          [field]: value,
        }));
        break;
      default:
        break;
    }
  };

  const handleSave = (section) => {
    // Handle saving data or API calls here based on section
    switch (section) {
      case 'beacon':
        alert('Saving Beacon Data:' + beaconData.color);
        console.log('Saving Beacon Data:', beaconData);
        break;
      case 'buzzer':
        alert('Saving Buzzer Data: ' + buzzerData);
        console.log('Saving Buzzer Data:', buzzerData);
        break;
      case 'chargeControl':
        alert('Saving Charge Control Data: ' + chargeControlData.minBatteryPercentage + "%");
        console.log('Saving Charge Control Data:', chargeControlData.minBatteryPercentage);
        break;
      default:
        break;
    }
  };

  const TimeDisplay = () => {
    const [currentTime, setCurrentTime] = useState(null);
    const [geoCoordinates, setGeoCoordinates] = useState({ latitude: latitude, longitude: longitude });

    useEffect(() => {
      const getTimeForCoordinates = async () => {
        try {
          const response = await fetch(`https://www.timeapi.io/api/Time/current/coordinate?latitude=${geoCoordinates.latitude}&longitude=${geoCoordinates.longitude}`);

          if (!response.ok) {
            throw new Error('Failed to fetch time data');
          }

          const data = await response.json();
          setCurrentTime(new Date(data.dateTime));
        } catch (error) {
          console.error('Error fetching time data:', error);
        }
      };


      const interval = setInterval(() => {
        getTimeForCoordinates();
      }, 1000);


      return () => clearInterval(interval);
    }, [geoCoordinates]);

    if (!currentTime) {
      return (
        <div>
          <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography fontWeight="bold">Loading...</Typography>
          </Stack>
        </div>
      );
    }

    return (
      <div>
        <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography>Device Current Time</Typography><Typography fontWeight="bold">{currentTime.toLocaleTimeString()}</Typography>
        </Stack>
      </div>
    );
  };



  return (
    <div>
      <Head>
        <title>
          Customers | MyHomeBeacon
        </title>
      </Head>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="none"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label={`User Page: ${username}`} {...a11yProps(0)}
            sx={{
              backgroundColor: value === 0 ? 'rgba(229, 228, 226,0.7)' : 'inherit',
              width: tabWidth,
              border: value === 0 ? '1px solid rgb(169, 169, 169)' : 'transparent',
              borderTopLeftRadius: value === 0 ? '10px' : '0',
              borderTopRightRadius: value === 0 ? '10px' : '0',
              borderBottom: value === 0 ? '0' : '1px solid rgb(169, 169, 169)',
              margin: 0
            }} />
          <Tab label="HomeHub" {...a11yProps(1)}
            sx={{
              backgroundColor: value === 1 ? 'rgba(229, 228, 226,0.7)' : 'inherit',
              width: tabWidth,
              border: value === 1 ? '1px solid rgb(169, 169, 169)' : 'transparent',
              borderTopLeftRadius: value === 1 ? '10px' : '0',
              borderTopRightRadius: value === 1 ? '10px' : '0',
              borderBottom: value === 1 ? '0' : '1px solid rgb(169, 169, 169)',
            }} />
          <Tab label="Beacon" {...a11yProps(2)}
            sx={{
              backgroundColor: value === 2 ? 'rgba(229, 228, 226,0.7)' : 'inherit',
              width: tabWidth,
              border: value === 2 ? '1px solid rgb(169, 169, 169)' : 'transparent',
              borderTopLeftRadius: value === 2 ? '10px' : '0',
              borderTopRightRadius: value === 2 ? '10px' : '0',
              borderBottom: value === 2 ? '0' : '1px solid rgb(169, 169, 169)',
              margin: 0
            }} />
          <Tab label="Puck" {...a11yProps(3)}
            sx={{
              backgroundColor: value === 3 ? 'rgba(229, 228, 226,0.7)' : 'inherit',
              width: tabWidth,
              border: value === 3 ? '1px solid rgb(169, 169, 169)' : 'transparent',
              borderTopLeftRadius: value === 3 ? '10px' : '0',
              borderTopRightRadius: value === 3 ? '10px' : '0',
              borderBottom: value === 3 ? '0' : '1px solid rgb(169, 169, 169)',
            }} />
          <Tab label="Device Settings" {...a11yProps(4)}
            sx={{
              backgroundColor: value === 4 ? 'rgba(229, 228, 226,0.7)' : 'inherit',
              width: tabWidth,
              border: value === 4 ? '1px solid rgb(169, 169, 169)' : 'transparent',
              borderTopLeftRadius: value === 4 ? '10px' : '0',
              borderTopRightRadius: value === 4 ? '10px' : '0',
              borderBottom: value === 4 ? '0' : '1px solid rgb(169, 169, 169)',
              margin: 0
            }} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Stack spacing={2}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* <Stack spacing={1}>
                <Typography variant="h4">
                  User Page: {username}
                </Typography>
              </Stack> */}
            <Stack sx={{ flex: 0.24, border: "1px solid rgb(229, 228, 226)", borderRadius: "5px", width: "fit-content", margin: "5px", marginLeft: 0, padding: "5px", display: "flex", alignItems: "center", float: "right", background: "rgba(17, 25, 39,0.8)", color: "aliceblue" }}>
              <Typography fontWeight="medium">SET-UP </Typography>
              <Typography>Requested: YES </Typography>
            </Stack>
            <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
              Offline Count : 6
              {/* {offline} */}
              <WarningIcon sx={{ color: warningIconColor, padding: "2px" }} />
              <WarningIcon sx={{ color: warningIconColor, padding: "2px" }} />
              <WarningIcon sx={{ color: warningIconColor, padding: "2px" }} />
            </Typography>
          </div>
          <Stack spacing={2}>
            {/* <Stack> */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Stack sx={{ flex: 0.2, border: "1px solid rgb(229, 228, 226)", borderRadius: "5px", width: "fit-content", margin: "5px", marginLeft: 0, padding: "5px", display: "flex", alignItems: "center", float: "right", background: "linear-gradient(90deg, rgba(219,48,48,0.1) 0%, rgba(39,12,161,0.1) 100%)" }}>
                {/* <Typography fontWeight="bold">Device Time</Typography> */}
                <Typography fontWeight="medium">Alive From</Typography>
                <Typography >November 19, 2023</Typography>
                <Typography >3:30 PM</Typography>
              </Stack>
              <Stack sx={{ flex: 0.2, height: "10vh", border: "1px solid rgb(229, 228, 226)", borderRadius: "5px", width: "fit-content", margin: "5px", marginRight: 0, padding: "5px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(90deg, rgba(219,48,48,0.1) 0%, rgba(39,12,161,0.1) 100%)" }}>
                <TimeDisplay />
              </Stack>
            </div>
            {/* </Stack> */}
            <Typography variant="h6">Emergency Contacts</Typography>
            <Emergencytable />
          </Stack>
          <Stack spacing={1}>
            <Typography variant="h6">Household Members</Typography>
            <Householdtable />
          </Stack>
        </Stack>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Stack spacing={2}>
          <Typography variant="h6">HomeHub Logs</Typography>
          <Homehublogtable />
          <Typography variant="h6">HomeHub Errors</Typography>
          <Homehuberrortable />
        </Stack>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Stack spacing={2}>
          <Typography variant="h6">Beacon Logs</Typography>
          <Beaconlogtable />
          <Typography variant="h6">Beacon Errors</Typography>
          <Beaconerrortable />
        </Stack>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Stack spacing={2}>
          <Typography variant="h6">Puck Logs</Typography>
          <Pucklogtable />
          <Typography variant="h6">Puck Errors</Typography>
          <Puckerrortable />
        </Stack>
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Box
          component="main"
          sx={{
            flexGrow: 1
          }}
        >

          {/* <Stack spacing={3} >
                <Typography variant="h4">
                  User Settings
                </Typography>
              </Stack> */}
          <Stack spacing={1} >
            <Container sx={{ display: "-webkit-flex" }}>
              <Card>
                <CardHeader title="Beacon" sx={{ paddingTop: 2, paddingRight: 3, paddingBottom: 2 }} />
                {/* <Divider /> */}
                <CardContent sx={{ display: "flex", paddingBottom: 0, paddingTop: 0 }}>
                  <ChromePicker color={beaconData.color} onChange={handleColorChange} />
                  <Stack spacing={1} paddingLeft={5} sx={{ maxWidth: 700 }}>
                    <Box sx={{ width: 400 }}>
                      <Typography >Brightness:</Typography>
                      <Slider
                        value={beaconData.brightness}
                        onChange={handleBrightnessChange}
                        aria-label="Default"
                        valueLabelDisplay="auto" />
                    </Box>
                    <TextField
                      label="Pattern On-Time (ms)"
                      value={beaconData.onTime}
                      onChange={(e) => handleInputChange(e, 'beacon', 'onTime')}
                    />
                    <TextField
                      label="Pattern Off-Time (ms)"
                      value={beaconData.offTime}
                      onChange={(e) => handleInputChange(e, 'beacon', 'offTime')}
                    />
                    <TextField
                      label="Active Duration (sec)"
                      value={beaconData.duration}
                      onChange={(e) => handleInputChange(e, 'beacon', 'duration')}
                    />
                  </Stack>
                  <Stack spacing={1} paddingLeft={5} sx={{ maxWidth: 700 }}>
                    <Box sx={{ width: 400, paddingBottom: 4.5 }}>
                      <Typography >LED:</Typography>
                    </Box>
                    <TextField
                      label="Pattern On-Time (ms)"
                      value={buzzerData.onTime}
                      onChange={(e) => handleInputChange(e, 'buzzer', 'onTime')}
                    />
                    <TextField
                      label="Pattern Off-Time (ms)"
                      value={buzzerData.offTime}
                      onChange={(e) => handleInputChange(e, 'buzzer', 'offTime')}
                    />
                    <TextField
                      label="Active Duration (sec)"
                      value={buzzerData.duration}
                      onChange={(e) => handleInputChange(e, 'buzzer', 'duration')}
                    />
                  </Stack>
                </CardContent>
                <Card>
                  <CardHeader title="Charge Control" sx={{ paddingTop: 2, paddingRight: 3, paddingBottom: 2 }} />
                  {/* <Divider /> */}
                  <CardContent sx={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Stack spacing={1} sx={{ maxWidth: 700 }}>
                      <TextField
                        label="Minimum battery percentage to start charge"
                        value={chargeControlData.minBatteryPercentage}
                        onChange={(e) =>
                          handleInputChange(e, 'chargeControl', 'minBatteryPercentage')
                        }
                      />
                    </Stack>
                  </CardContent>
                  {/* <Divider />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={() => handleSave('chargeControl')}>
                    Save
                  </Button>
                </CardActions> */}
                </Card>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={() => {
                    handleSubmit();
                  }}>
                    Save
                  </Button>
                </CardActions>
              </Card>
            </Container>
            <Container>

            </Container>
          </Stack>


        </Box>
      </TabPanel>
    </div>
  );
};

UserPage.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);
export default UserPage;
