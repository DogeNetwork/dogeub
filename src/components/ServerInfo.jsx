import { useState, useEffect } from 'react';
import { useOptions } from '/src/utils/optionsContext';
import clsx from 'clsx';

const ServerInfo = () => {
    const { options } = useOptions();
    const [serverIp, setServerIp] = useState('Loading...');
    const [ping, setPing] = useState('--');
    const [region, setRegion] = useState('Loading...');

    useEffect(() => {
        const host = location.hostname || location.host;
        setServerIp(host);

        fetch('https://ipapi.co/json/')
            .then((res) => res.json())
            .then((data) => {
                if (data.city && data.region) {
                    setRegion(`${data.city}, ${data.region}`);
                } else if (data.country_name) {
                    setRegion(data.country_name);
                } else {
                    setRegion('Unknown');
                }
            })
            .catch(() => setRegion('Unknown'));

        const measurePing = () => {
            const start = performance.now();
            fetch('/wisp/', { method: 'HEAD', cache: 'no-cache' })
                .then(() => {
                    const end = performance.now();
                    setPing(`${Math.round(end - start)}ms`);
                })
                .catch(() => {
                    const start2 = performance.now();
                    fetch('/', { method: 'HEAD', cache: 'no-cache' })
                        .then(() => {
                            const end2 = performance.now();
                            setPing(`${Math.round(end2 - start2)}ms`);
                        })
                        .catch(() => setPing('--'));
                });
        };

        measurePing();
        const interval = setInterval(measurePing, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className={clsx(
                'pl-1 text-left text-sm',
                options?.type === 'dark' || !options?.type ? 'text-gray-400' : 'text-gray-600',
            )}
            style={{ color: options.siteTextColor ? `${options.siteTextColor}99` : undefined }}
        >
            <div className="space-y-1">
                <div>
                    <span className="opacity-70">Server IP: </span>
                    <span>{serverIp}</span>
                </div>
                <div>
                    <span className="opacity-70">Ping: </span>
                    <span>{ping}</span>
                </div>
                <div>
                    <span className="opacity-70">Region: </span>
                    <span>{region}</span>
                </div>
            </div>
        </div>
    );
};

export default ServerInfo;

