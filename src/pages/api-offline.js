import {
  Box,
  Button,
  Container,
  Stack,
  Alert,
  CircularProgress,
  Typography,
  SvgIcon,
} from "@mui/material";
import { Grid } from "@mui/system";
import Head from "next/head";
import { useState, useEffect } from "react";
import axios from "axios";
import { CippImageCard } from "../components/CippCards/CippImageCard";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ErrorOutlineOutlined } from "@mui/icons-material";

const ApiOfflinePage = () => {
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [apiVersion, setApiVersion] = useState(null);

  // Check API version when component mounts
  useEffect(() => {
    const checkApiVersion = async () => {
      try {
        const response = await axios.get("/version.json", { timeout: 5000 });
        setApiVersion(response.data?.version || "Unknown");
      } catch (error) {
        console.error("Failed to fetch API version:", error);
      }
    };

    checkApiVersion();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      // Try to ping the API
      const testCall = await axios.get("/api/me", { timeout: 45000 });
      console.log("API Test Call Response:", testCall);
      if (!testCall.headers["content-type"]?.includes("application/json")) {
        throw new Error("API did not return the expected response.");
      }
      setTestResult({ success: true, message: "Connection successful! Try refreshing the page." });
    } catch (error) {
      let errorMessage = "Connection failed.";

      if (error.response) {
        // Request was made and server responded with a status code outside of 2xx range
        errorMessage = `API responded with status: ${error.response.status}`;
        if (error.response.status === 404) {
          errorMessage +=
            " (API endpoint not found, this can be the case if your Function App is on Version 7 or below)";
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response received from API. Check if your Function App is running.";
      } else {
        // Error in setting up the request
        errorMessage = `Error: ${error.message}`;
      }

      setTestResult({ success: false, message: errorMessage });
    } finally {
      setTestingConnection(false);
    }
  };

  // We're now using Typography components directly in the JSX
  // instead of generating a help text string

  return (
    <>
      <Head>
        <title>API Offline</title>
      </Head>
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
          height: "100vh", // Full height of the viewport
          bgcolor: "background.default", // Add background color to match theme
        }}
      >
        <Container maxWidth={false}>
          <Stack spacing={6} sx={{ height: "100%" }}>
            <Grid
              container
              spacing={3}
              justifyContent="center" // Center horizontally
              alignItems="center" // Center vertically
              sx={{ height: "100%" }} // Ensure the container takes full height
            >
              <Grid item size={{ md: 6, xs: 12 }}>
                <CippImageCard
                  isFetching={false}
                  imageUrl="/assets/illustrations/undraw_server_status_re_n8ln.svg"
                  title={
                    <Typography variant="h4" component="h1" gutterBottom>
                      <SvgIcon sx={{ verticalAlign: "middle", mr: 1, color: "error.main" }}>
                        <ErrorOutlineOutlined />
                      </SvgIcon>
                      CIPP API Unreachable
                    </Typography>
                  }
                  text={
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1">
                        The CIPP API appears to be offline or out of date.
                        {apiVersion && (
                          <Typography
                            component="span"
                            sx={{ fontWeight: "medium", display: "block", mt: 1 }}
                          >
                            Frontend Version: {apiVersion}
                          </Typography>
                        )}
                      </Typography>

                      <Typography variant="body1" sx={{ mt: 2 }}>
                        If you are self-hosting CIPP, please ensure your Function App is running and
                        up to date. If you are using the hosted version, please check your
                        subscription in GitHub.
                      </Typography>
                    </Box>
                  }
                  linkText={testingConnection ? "Testing Connection..." : "Test API Connection"}
                  onButtonClick={handleTestConnection}
                />

                {testResult && (
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Alert severity={testResult.success ? "success" : "error"}>
                      <Typography variant="body2">{testResult.message}</Typography>
                      {testResult.success && (
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{ mt: 1 }}
                          onClick={() => window.location.reload()}
                        >
                          Refresh Page
                        </Button>
                      )}
                    </Alert>
                  </Box>
                )}

                {testingConnection && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default ApiOfflinePage;
