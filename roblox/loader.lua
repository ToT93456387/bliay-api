-- Custom Roblox Loader (similar to Luarmor)
-- Setup: _G.Key = "LA-XXXX-XXXX-XXXX"

local key = _G.Key
local host = "http://localhost:5000" -- Change this to your domain when hosting online!

if not key or key == "" then
    warn("==============================================")
    warn(" [Loader Error]: _G.Key is not set or empty!")
    warn(" Please define: _G.Key = \"YOUR-LICENSE-KEY\"")
    warn("==============================================")
    return
end

-- HWID Detection logic compatible with major Roblox executors
local function getHwid()
    local hwid = "Unknown"
    
    -- Check for executor-specific HWID functions
    local success, result = pcall(function()
        if gethwid then return gethwid() end
        if get_hwid then return get_hwid() end
        if cloneref then
            local analytics = cloneref(game:GetService("RbxAnalyticsService"))
            return analytics:GetClientId()
        end
        return game:GetService("RbxAnalyticsService"):GetClientId()
    end)
    
    if success and result then
        hwid = result
    end
    
    return hwid
end

local clientHwid = getHwid()

print("[Loader]: Initializing handshake...")
print("[Loader]: HWID detected: " .. tostring(clientHwid))

-- Make HTTP POST request to API Verification endpoint
local httpService = game:GetService("HttpService")
local url = host .. "/api/v1/verify"

local payload = {
    key = key,
    hwid = clientHwid
}

local success, response = pcall(function()
    return request({
        Url = url,
        Method = "POST",
        Headers = {
            ["Content-Type"] = "application/json"
        },
        Body = httpService:JSONEncode(payload)
    })
end)

-- Fallback HTTP request in case "request" isn't supported (some older executors use custom functions)
if not success or not response then
    success, response = pcall(function()
        -- Fallback to HttpPost (note: HttpPost runs synchronously on some clients)
        local body = httpService:JSONEncode(payload)
        return {
            StatusCode = 200,
            Body = game:HttpPost(url, body, "application/json")
        }
    end)
end

if not success or not response then
    warn("[Loader Error]: Handshake failed. Cannot connect to verification server.")
    return
end

-- Process the server response
local responseBody = response.Body
local jsonSuccess, data = pcall(function()
    return httpService:JSONDecode(responseBody)
end)

if not jsonSuccess or not data then
    warn("[Loader Error]: Failed to decode server response.")
    print("Raw response: " .. tostring(responseBody))
    return
end

if data.success == true and data.script then
    print("[Loader]: License key verified! Executing script...")
    
    -- Compile and run the loaded Lua script payload
    local loadFunc, err = loadstring(data.script)
    if not loadFunc then
        warn("[Loader Error]: Script compilation failed: " .. tostring(err))
    else
        local execSuccess, execErr = pcall(loadFunc)
        if not execSuccess then
            warn("[Loader Error]: Script execution error: " .. tostring(execErr))
        end
    end
else
    warn("==============================================")
    warn(" [Verification Denied]: " .. tostring(data.message or "Invalid License"))
    warn("==============================================")
end
